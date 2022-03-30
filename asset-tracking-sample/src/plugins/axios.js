require('dotenv').config()
import axios from 'axios';
console.log(process.env)
export default axios.create({
    baseURL: `https://${process.env.VUE_APP_TENANT}/`,
    headers: {
        Authorization: `Bearer ${process.env.VUE_APP_TOKEN}`
    }
});