import {
  FETCH_DEVICES,
  FETCH_DEVICE,
  FETCH_TWINS,
  FETCH_TWIN,
  SET_DEVICES,
  SET_DEVICE,
  SET_TWINS,
  SET_TWIN, CLEAR_DEVICE, CLEAR_TWIN
} from '@/store/modules/app/types'
import { DEVICES_ENDPOINT, IOT_ENDPOINT, TWINS_ENDPOINT } from '@/store/modules/app/constants'

export default {
  [FETCH_DEVICES]({ commit }, { start = 0, limit = 5 }) {
    return this.axios
      .getAuth(`${DEVICES_ENDPOINT}?start=${start}&limit=${limit}`)
      .then((res) => res.data)
      .then((response) => {
        commit(SET_DEVICES, response)
      })
      .catch((err) => {
        console.log('ERROR', err)
      })
  },
  [FETCH_TWINS]({ commit }) {
    return this.axios
      .getAuth(`${TWINS_ENDPOINT}`)
      .then((res) => res.data)
      .then((response) => {
        commit(SET_TWINS, response)
      })
      .catch((err) => {
        console.log('ERROR', err)
      })
  },
  async [FETCH_DEVICE]({ commit }, { UUID }) {
    commit(CLEAR_DEVICE)
    const latestCounterInfo = await this.axios
      .getAuth(`${IOT_ENDPOINT}/devices/counters/latest/${UUID}`)
      .then((res) => res.data)
      .then((response) => {
        return response[0]
      })

    const {device, latestMetrics} = latestCounterInfo

    const modifiedLatestMetrics = latestMetrics.map(data => {
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated).toLocaleDateString()
      }
    })

    commit(SET_DEVICE, {
      device,
      latestMetrics: modifiedLatestMetrics
    })
  },
  [FETCH_TWIN]({ commit }, { UUID }) {
    commit(CLEAR_TWIN)
    return this.axios
      .getAuth(`${TWINS_ENDPOINT}/${UUID}`)
      .then((res) => res.data)
      .then((response) => {
        commit(SET_TWIN, response)
      })
      .catch((err) => {
        console.log('ERROR', err)
      })
  }
}
