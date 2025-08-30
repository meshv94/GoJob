import Group from "../models/Group.js";

export class Groups {
  static async getAllGroup(req, res) {
    try {
      const groups = await Group.find(
        { userId: req.user._id, isActive: true },       // query filter
        { __v: 0 }                                      // projection (instead of .select)
      )
        .sort({ createdAt: -1 })
        .lean();                                        // return plain JS objects (faster than Mongoose docs)

      return res.status(200).json({ success: true, groups });
    } catch (error) {
      console.error("Get groups error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  static async getGroupById(req, res){
    try {
      const group = await Group.findOne({ 
        _id: req.params.id, 
        userId: req.user._id,
        isActive: true 
      });
      
      if (!group) {
        return res.status(404).json({ success : false, message: 'Group not found' });
      }
      
      res.status(200).json({ success : true, group });
    } catch (error) {
      console.error('Get group error:', error);
      res.status(500).json({ success : false, message: 'Server error' });
    }
  }

  static async createGroup(req, res){
    try {
      // Validation is now handled by middleware
      const { name, emails, minEmails, maxEmails, tags, description } = req.body;

      // Validate email count constraints
      if (emails.length < (minEmails || 1)) {
        return res.status(400).json({ 
          success: false,
          message: `Group must have at least ${minEmails || 1} emails` 
        });
      }
      
      if (emails.length > (maxEmails || 1000)) {
        return res.status(400).json({ 
          success: false,
          message: `Group cannot have more than ${maxEmails || 1000} emails` 
        });
      }

      const group = new Group({
        name,
        userId: req.user._id,
        emails,
        minEmails: minEmails || 1,
        maxEmails: maxEmails || 1000,
        tags: tags || [],
        description
      });
        
      await group.save();
        
      res.status(201).json({ 
        success: true,
        message: 'Group created successfully',
        group
      });
    } catch (error) {
      console.error('Create group error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async updateGroupById(req, res){
    try {
      // Validation is now handled by middleware
      const { name, emails, minEmails, maxEmails, tags, description } = req.body;

      const group = await Group.findOne({ 
        _id: req.params.id, 
        userId: req.user._id,
        isActive: true 
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      // Validate email count constraints if emails are being updated
      if (emails && Array.isArray(emails)) {
        if (emails.length < (minEmails || group.minEmails || 1)) {
          return res.status(400).json({ 
            success: false,
            message: `Group must have at least ${minEmails || group.minEmails || 1} emails` 
          });
        }
        
        if (emails.length > (maxEmails || group.maxEmails || 1000)) {
          return res.status(400).json({ 
            success: false,
            message: `Group cannot have more than ${maxEmails || group.maxEmails || 1000} emails` 
          });
        }
      }
      
      // Update fields only if they are provided
      if (name !== undefined) group.name = name;
      if (emails !== undefined) group.emails = emails;
      if (minEmails !== undefined) group.minEmails = minEmails;
      if (maxEmails !== undefined) group.maxEmails = maxEmails;
      if (tags !== undefined) group.tags = tags;
      if (description !== undefined) group.description = description;
      
      await group.save();
      
      res.status(200).json({ 
        success: true,
        message: 'Group updated successfully',
        group
      });
    } catch (error) {
      console.error('Update group error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async deleteGroupById(req, res){
    try {
      const group = await Group.findOne({ 
        _id: req.params.id, 
        userId: req.user._id,
        isActive: true 
      });
      
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      group.isActive = false;
      await group.save();
      
      res.status(200).json({ success: true, message: 'Group deleted successfully' });
    } catch (error) {
      console.error('Delete group error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async addEmailsInToGroup(req, res){
    try {
      // Validation is now handled by middleware
      const { emails } = req.body;

      const group = await Group.findOne({ 
        _id: req.params.id, 
        userId: req.user._id,
        isActive: true 
      });
      
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      // Check if adding emails would exceed max limit
      if (group.emails.length + emails.length > group.maxEmails) {
        return res.status(400).json({ 
          success: false,
          message: `Adding these emails would exceed the maximum limit of ${group.maxEmails}`,
          currentCount: group.emails.length,
          tryingToAdd: emails.length,
          maxAllowed: group.maxEmails
        });
      }
      
      // Add new emails
      group.emails.push(...emails);
      await group.save();
      
      res.status(200).json({ 
        success: true,
        message: 'Emails added successfully',
        group
      });
    } catch (error) {
      console.error('Add emails error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async removeEmailsFromGroup(req, res){
    try {
      // Validation is now handled by middleware
      const { emailIds } = req.body;
        
      const group = await Group.findOne({ 
        _id: req.params.id, 
        userId: req.user._id,
        isActive: true 
      });
      
      if (!group) {
        return res.status(404).json({ success: false, message: 'Group not found' });
      }
      
      // Validate that email IDs are within valid range
      const maxIndex = group.emails.length - 1;
      const invalidIds = emailIds.filter(id => id > maxIndex);
      if (invalidIds.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Some email IDs are out of range',
          invalidIds,
          maxValidIndex: maxIndex,
          totalEmails: group.emails.length
        });
      }
      
      // Remove emails by index
      group.emails = group.emails.filter((_, index) => !emailIds.includes(index));
      
      // Check if removing emails would go below min limit
      if (group.emails.length < group.minEmails) {
        return res.status(400).json({ 
          success: false,
          message: `Removing these emails would go below the minimum limit of ${group.minEmails}`,
          currentCount: group.emails.length,
          minRequired: group.minEmails,
          tryingToRemove: emailIds.length
        });
      }
      
      await group.save();
      
      res.status(200).json({ 
        success: true,
        message: 'Emails removed successfully',
        group
      });
    } catch (error) {
      console.error('Remove emails error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async importEmailsByCSV(req, res){
    try {
      // TODO: Implement CSV import functionality
      res.json({ success: true, message: 'CSV import functionality coming soon' });
    } catch (error) {
      console.error('Import emails error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
