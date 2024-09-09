export enum UserRoles {
  read = 'read',
  write = 'write'
}

export class JwtUser {
  uuid: string
  email: string
  organization_uuid: string
  roles: string[]

  constructor(jwt: any) {
    this.uuid = jwt.sub
    this.email = jwt.email
    this.organization_uuid = jwt.organization_uuid
    this.roles = jwt.roles || []
  }

  public hasRole(role: UserRoles): boolean {
    return this.roles.includes(role.toString())
  }
}