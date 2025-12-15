// Auth schemas
export {
  signUpSchema,
  signInSchema,
  updateUserSchema,
  validateSignUp,
  validateSignIn,
  validateUpdateUser,
  type SignUpInput,
  type SignInInput,
  type UpdateUserInput,
} from './auth.schema'

// Customer schemas
export {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
  validateCreateCustomer,
  validateUpdateCustomer,
  validateCustomerQuery,
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerQueryInput,
} from './customer.schema'

// Project schemas
export {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectEquipmentSchema,
  validateCreateProject,
  validateUpdateProject,
  validateProjectQuery,
  validateProjectEquipment,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectQueryInput,
  type ProjectEquipmentInput,
} from './project.schema'


// User management schemas
export {
  createTenantUserSchema,
  updateTenantUserSchema,
  inviteUserSchema,
  userQuerySchema,
  validateCreateTenantUser,
  validateUpdateTenantUser,
  validateInviteUser,
  validateUserQuery,
  type CreateTenantUserInput,
  type UpdateTenantUserInput,
  type InviteUserInput,
  type UserQueryInput,
} from './user.schema'

// CRM schemas
export {
  createCrmUserSchema,
  updateCrmUserSchema,
  crmUserQuerySchema,
  validateCreateCrmUser,
  validateUpdateCrmUser,
  validateCrmUserQuery,
  type CreateCrmUserInput,
  type UpdateCrmUserInput,
  type CrmUserQueryInput,
} from './crm.schema'