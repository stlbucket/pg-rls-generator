import { PgrTableSecurityProfileSet } from "./d"

const defaultPgrTableSecurityProfileSet: PgrTableSecurityProfileSet = {
  "defaultProfileName": "super-admin-crud::user-read",
  "defaultInsertExclusions": [
    "id",
    "created_at"
  ],
  "defaultUpdateExclusions": [
    "id",
    "created_at"
  ],
  "tableSecurityProfiles": [
    {
      "name": "all-actions::all-users",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "soro_user"
          }
        ],
        "INSERT": [
          {
            "roleName": "soro_user",
            "exclusions": ["created_at"]
          }
        ],
        "UPDATE": [
          {
            "roleName": "soro_user",
            "exclusions": ["id", "created_at"]
          }
        ],
        "DELETE": [
          {
            "roleName": "soro_user"
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "cmd": "SELECT",
            "qual": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_select",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "cmd": "INSERT",
            "qual": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_insert",
            "with_check": null
          }
        ],
        "UPDATE": [
          {
            "cmd": "UPDATE",
            "qual": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_update",
            "with_check": null
          }
        ],
        "DELETE": [
          {
            "cmd": "DELETE",
            "qual": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_delete",
            "with_check": null
          }
        ]
      }
    },
    {
      "name": "super-admin-crud::user-read",
      "enableRls": true,
      "grants": {
        "ALL": [],
        "SELECT": [
          {
            "roleName": "soro_user"
          }
        ],
        "INSERT": [
          {
            "roleName": "soro_super_admin",
          }
        ],
        "UPDATE": [
          {
            "roleName": "soro_super_admin",
          }
        ],
        "DELETE": [
          {
            "roleName": "soro_super_admin",
          }
        ]
      },
      "policies": {
        "ALL": [],
        "SELECT": [
          {
            "cmd": "SELECT",
            "qual": "soro.check_access(seller_id)",
            "roles": [
              "soro_user"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_select",
            "with_check": null
          }
        ],
        "INSERT": [
          {
            "cmd": "INSERT",
            "qual": "true",
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_insert",
            "with_check": null
          }
        ],
        "UPDATE": [
          {
            "cmd": "UPDATE",
            "qual": "true",
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_update",
            "with_check": null
          }
        ],
        "DELETE": [
          {
            "cmd": "DELETE",
            "qual": "true",
            "roles": [
              "soro_super_admin"
            ],
            "permissive": "PERMISSIVE",
            "policyname": "can_delete",
            "with_check": null
          }
        ]
      }
    }
  ]
}

export default defaultPgrTableSecurityProfileSet