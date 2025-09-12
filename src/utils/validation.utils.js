// src/utils/validation.utils.js
const { z } = require('zod');

// User registration validation
const registerUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name too long'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name too long'),
  roleId: z.string().cuid('Invalid role ID format')
});

// User login validation
const loginUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

// Update user validation
const updateUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name too long').optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name too long').optional(),
  isActive: z.boolean().optional()
});

// Change password validation
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')
});

// Company validation schemas
const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255, 'Company name too long'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Industry is required').max(100, 'Industry name too long'),
  location: z.string().min(1, 'Location is required').max(255, 'Location too long'),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'], {
    errorMap: () => ({ message: 'Invalid company size' })
  }),
  description: z.string().max(1000, 'Description too long').optional(),
  agreementStatus: z.enum(['Pending', 'Signed', 'Rejected', 'Under Review'], {
    errorMap: () => ({ message: 'Invalid agreement status' })
  }),
  fee: z.number().positive('Fee must be a positive number').optional(),
  paymentTerms: z.string().max(500, 'Payment terms too long').optional(),
  warranty: z.string().max(500, 'Warranty description too long').optional()
});

const updateCompanySchema = createCompanySchema.partial();

// Job Posting validation schemas
const createJobPostingSchema = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  title: z.string().min(1, 'Job title is required').max(255, 'Job title too long'),
  location: z.string().min(1, 'Job location is required').max(255, 'Location too long'),
  jobLink: z.string().url('Invalid job link URL').optional().or(z.literal('')),
  category: z.string().min(1, 'Category is required').max(100, 'Category too long'),
  experienceRange: z.string().min(1, 'Experience range is required').max(100, 'Experience range too long'),
  salaryRange: z.string().min(1, 'Salary range is required').max(100, 'Salary range too long'),
  description: z.string().min(1, 'Description is required'),
  sourceUrl: z.string().url('Invalid source URL').optional().or(z.literal('')),
  timeZone: z.string().max(50, 'Time zone too long').optional(),
  additionalNotes: z.string().max(2000, 'Additional notes too long').optional(),
  createdBy: z.string().min(1, 'Created by is required').max(255, 'Created by too long'),
  modifiedBy: z.string().max(255, 'Modified by too long').optional(),
  bdmAssigned: z.string().max(255, 'BDM assigned too long').optional(),
  statusId: z.string().cuid('Invalid status ID').optional(),
  validation: z.boolean().default(false)
});

const updateJobPostingSchema = createJobPostingSchema.partial().omit({ 
  companyId: true
});

// Job Posting Status validation schemas
const createJobPostingStatusSchema = z.object({
  name: z.string().min(1, 'Status name is required').max(100, 'Status name too long'),
  isActive: z.boolean().default(true)
});

const updateJobPostingStatusSchema = createJobPostingStatusSchema.partial();

const bulkCreateJobPostingSchema = z.object({
  jobPostings: z.array(createJobPostingSchema).min(1, 'At least one job posting is required')
});

const bulkDeleteJobPostingSchema = z.object({
  ids: z.array(z.string().cuid('Invalid job posting ID')).min(1, 'At least one ID is required')
});

// POC validation schemas
const createPOCSchema = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  email: z.string().email('Invalid email address').max(255, 'Email too long'),
  designation: z.string().min(1, 'Designation is required').max(100, 'Designation too long'),
  location: z.string().min(1, 'Location is required').max(255, 'Location too long'),
  phone: z.string().max(20, 'Phone number too long').optional(),
  mobile: z.string().max(20, 'Mobile number too long').optional(),
  department: z.string().max(100, 'Department name too long').optional()
});

const updatePOCSchema = createPOCSchema.partial().omit({ companyId: true });

// Validation middleware function
const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedData = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
      
      next(error);
    }
  };
};

module.exports = {
  registerUserSchema,
  loginUserSchema,
  updateUserSchema,
  changePasswordSchema,
  createCompanySchema,
  updateCompanySchema,
  createJobPostingSchema,
  updateJobPostingSchema,
  createJobPostingStatusSchema,
  updateJobPostingStatusSchema,
  bulkCreateJobPostingSchema,
  bulkDeleteJobPostingSchema,
  createPOCSchema,
  updatePOCSchema,
  validateRequest
};