import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: process.env.VUE_APP_API_BASE_URL,
    timeout: 60000, // 请求超时时间
    withCredentials: true
})

export function getDatasets(parameter) {
    return request({
        url: "/api/dataset/list",
        method: 'get',
        params: parameter
    })
}

export function createDataset(parameter) {
    return request({
        url: "/api/dataset/add",
        method: 'post',
        data: parameter
    })
}

export function updateDataset(parameter) {
    return request({
        url: "/api/dataset/update",
        method: 'put',
        data: parameter
    })
}