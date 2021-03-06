import { PgrRoleSet } from "../d"

const roleSet: PgrRoleSet = {
  "name": "soro-anon",
  "dbOwnerRole": {
    "roleName": "soro",
    "applicableRoles": []
  },
  "dbAuthenticatorRole": {
    "roleName": "postgres",
    "applicableRoles": [
      {
        "roleName": "soro_super_admin"
      },
      {
        "roleName": "soro_admin"
      },
      {
        "roleName": "soro_user"
      },
      {
        "roleName": "soro_anonymous"
      }
    ]
  },
  "dbUserRoles": [
    {
      "roleName": "soro_super_admin",
      "applicableRoles": []
    },
    {
      "roleName": "soro_admin",
      "applicableRoles": []
    },
    {
      "roleName": "soro_user",
      "applicableRoles": []
    },
    {
      "roleName": "soro_anonymous",
      "applicableRoles": []
    }
  ]
}

export default roleSet