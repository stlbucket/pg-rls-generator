function computeRlsPolicyTree(state) {
  const currentRlsPolicies = state.managedSchemata
    .reduce(
      (a, s) => {
        console.log(s.schemaName)
        return {
          ...a,
          [s.schemaName]: s.schemaTables.reduce(
            (a, t) => {
              return {
                ...a,
                [t.tableName]: {
                  policies: t.policies.reduce(
                    (a,p) => {
                      const existing = a[p.cmd] || []
                      const policy = `CREATE POLICY ${p.policyname} ON ${p.schemaname}.${p.tablename} FOR ${p.cmd} TO ${p.roles.join(',')} USING (${p.qual}) WITH CHECK (${p.withCheck});`
                      return {
                        ...a,
                        [p.cmd]: [...existing, policy]
                      }
                    }, {
                      rlsEnabled: t.rlsEnabled,
                      SELECT: [],
                      INSERT: [],
                      UPDATE: [],
                      DELETE: [],
                      ALL: []
                    }
                  ),
                  grants: []
                }
              }
            }, {
            }
          )
        }
      }, {}
    )
  const rlsPolicyTree = {
    current: currentRlsPolicies
  }
  return rlsPolicyTree
}

export default computeRlsPolicyTree