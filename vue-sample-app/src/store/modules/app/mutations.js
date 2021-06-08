import {
  SET_DEVICES,
  SET_TWINS,
  SET_DEVICE,
  SET_TWIN,
  CLEAR_TWIN,
  CLEAR_DEVICE
} from '@/store/modules/app/types'

export default {
  [SET_DEVICES](state, devices) {
    state.devices = devices
  },
  [SET_TWINS](state, twins) {
    state.twins = twins
  },
  [SET_DEVICE](state, device) {
    state.device = device
  },
  [SET_TWIN](state, twin) {
    state.twin = twin
  },
  [CLEAR_TWIN](state) {
    state.twin = {}
  },
  [CLEAR_DEVICE](state) {
    state.device = {}
  }
}
