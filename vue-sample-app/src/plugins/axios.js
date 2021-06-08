import Vue from 'vue'
import axios from 'axios'
import cookies from 'vue-cookies'
import VueAxios from 'vue-axios'
import Vuex from 'vuex'

const {
    VUE_APP_PASSWORD: PASSWORD,
    VUE_APP_USERNAME: USERNAME,
    VUE_APP_TENANT_URL: TENANT_URL
} = process.env

const axiosInstance = axios.create({
    baseURL: `${TENANT_URL}/api/v1/`,
    headers: {
        'Content-Type': 'application/json'
    }
})
const addAuthMethod = function (axiosInstance, method) {
    return function () {
        const Authorization = 'Basic ' + new Buffer(USERNAME + ':' + PASSWORD).toString('base64')

        console.log(Authorization, 'Authorization')

        return axiosInstance[method](...arguments, {
            headers: {
                Authorization,
                'content-type': 'application/json'
            }
        })
    }
}

axiosInstance.postAuth = addAuthMethod(axiosInstance, 'post', cookies)
axiosInstance.getAuth = addAuthMethod(axiosInstance, 'get', cookies)
axiosInstance.patchAuth = addAuthMethod(axiosInstance, 'patch', cookies)
axiosInstance.putAuth = addAuthMethod(axiosInstance, 'put', cookies)
axiosInstance.deleteAuth = addAuthMethod(axiosInstance, 'delete', cookies)

Vue.use(cookies)
Vue.use(VueAxios, axiosInstance)
Vuex.Store.prototype.axios = axiosInstance
