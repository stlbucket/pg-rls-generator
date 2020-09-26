import { ConnectionConfig } from 'pg';

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

export interface PgrFunction {
  functionSchema: string,
  functionName: string,
  resultDataType: string,
  argumentDataTypes: string,
  definition: string
}

export interface PgrSchema {
  schemaName: string,
  schemaTables: PgrTable[],
  schemaViews: PgrTable[],
  schemaFunctions: PgrFunction[]
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
  permissive: string,
  policyname: string,
  with_check: string | null,
  schemaName?: string,
  tableName?: string
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

export interface PgrTableAssignment {
  [key: string]: string
}

export interface PgrTableProfileAssignmentSet {
  schemaName: string,
  tableAssignments: PgrTableAssignment
}


export interface PgrFunctionRoleGrantSet {
  EXECUTE: string[],
  [key: string]: string[] 
}

export interface PgrFunctionSecurityProfile {
  name: string,
  grants: PgrFunctionRoleGrantSet
}

export interface PgrFunctionSecurityProfileSet {
  defaultProfileName: string,
  functionSecurityProfiles: PgrFunctionSecurityProfile[]
}

export interface PgrFunctionSecurityProfileAssignmentSet {
  schemaName: string,
  functionAssignments: any
}

export interface PgrConfig {
  dbConfig: ConnectionConfig,
  roleSet: PgrRoleSet,
  tableSecurityProfileSet: PgrTableSecurityProfileSet,
  functionSecurityProfileSet: PgrFunctionSecurityProfileSet,
  tableSecurityProfileAssignments: PgrTableProfileAssignmentSet[],
  functionSecurityProfileAssignments: PgrFunctionSecurityProfileAssignmentSet[],
}