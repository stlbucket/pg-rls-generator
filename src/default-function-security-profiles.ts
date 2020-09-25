import { PgrFunctionSecurityProfileSet } from "./d"

const defaultPgrFunctionSecurityProfileSet: PgrFunctionSecurityProfileSet = {
  "defaultProfileName": "super-admin-execute",
  "functionSecurityProfiles": [
    {
      "name": "super-admin-execute",
      "grants": {
        "EXECUTE": ["soro_super_admin"],
      }
    },
    {
      "name": "user-execute",
      "grants": {
        "EXECUTE": ["soro-user"],
      }
    }
  ]
}

export default defaultPgrFunctionSecurityProfileSet