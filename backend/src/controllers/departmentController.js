import Department from '../models/Department.js';

export async function getDepartments(req, res) {
  try {
    const departments = await Department.find();
    res.json({ success: true, data: departments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function createDepartment(req, res) {
  try {
    const { name, description, icon, color } = req.body;
    const department = new Department({ name, description, icon, color });
    await department.save();
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
}
