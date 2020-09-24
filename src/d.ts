import { string } from '@oclif/command/lib/flags';
import { PendingTestFunction } from 'mocha';

export interface PgrRole {
  roleName: string,
  applicableRoles?: PgrRole[]
}

export interface PgrTable {
  schemaName: string,
  tableName: string,
  tableColumns: any[],
  existingPolicies: PgrRlsPolicy[]
}

export interface PgrSchema {
  schemaName: string,
  schemaTables: PgrTable[],
  schemaViews: PgrTable[]
}

export interface PgrRoleSet {
  name: string,
  dbOwnerRole: PgrRole,
  dbAuthenticatorRole: PgrRole,
  dbUserRoles: PgrRole[]
}

export interface PgrRoleGrant {
  roleName: string,
  exclusions?: string[]
}

export interface PgrRoleGrantSet {
  SELECT: PgrRoleGrant[],
  INSERT: PgrRoleGrant[],
  UPDATE: PgrRoleGrant[],
  DELETE: PgrRoleGrant[],
  [key: string]: PgrRoleGrant[] 
}

export interface PgrRlsPolicy {
  cmd: string,
  qual: string,
  roles: string[],
  permissive: string
  policyname: string
  with_check: string | null
}

export interface PgrRlsPolicySet {
  SELECT: PgrRlsPolicy[],
  INSERT: PgrRlsPolicy[],
  UPDATE: PgrRlsPolicy[],
  DELETE: PgrRlsPolicy[],
  ALL: PgrRlsPolicy[],
  [key: string]: PgrRlsPolicy[]
}

export interface PgrTableSecurityProfile {
  name: string,
  enableRls: boolean,
  grants: PgrRoleGrantSet,
  policies: PgrRlsPolicySet
}

export type ColumnExclusionSet = string[]
  
export interface PgrTableSecurityProfileSet {
  defaultProfileName: string,
  defaultInsertExclusions: ColumnExclusionSet,
  defaultUpdateExclusions: ColumnExclusionSet,
  tableSecurityProfiles: PgrTableSecurityProfile[]
}

export interface PgrSchemaTableAssignmentSet {
  schemaName: string,
  tableAssignments: any
}

export interface PgrConfig {

}