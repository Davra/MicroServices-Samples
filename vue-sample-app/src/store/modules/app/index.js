import mutations from './mutations'
import actions from './actions'

export default {
    state: {
        device: {},
        devices: {
            records: [],
            totalRecords: 0
        },
        twin: {},
        twins: []
    },
    mutations,
    actions
}
