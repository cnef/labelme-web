import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    // API 请求的默认前缀
    baseURL: process.env.VUE_APP_API_BASE_URL,
    timeout: 30000, // 请求超时时间
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

export function importDataset(parameter) {
    return request({
        url: "/api/dataset/import",
        method: 'post',
        data: parameter
    })
}

export function exportDataset(parameter) {
    return request({
        url: "/api/dataset/export",
        method: 'post',
        data: parameter
    })
}

export function getDataset(parameter) {
    return request({
        url: "/api/dataset/get",
        method: 'get',
        params: parameter
    })
}

export function getImages(parameter) {
    return request({
        url: "/api/image/list",
        method: 'get',
        params: parameter
    })
}

export function getImage(parameter) {
    return request({
        url: "/api/image/get",
        method: 'get',
        params: parameter
    })
}

export function updateImage(parameter) {
    return request({
        url: "/api/image/update",
        method: 'put',
        data: parameter
    })
}

export function deleteImage(parameter) {
    return request({
        url: "/api/image/delete",
        method: 'delete',
        data: parameter
    })
}

export function detectImage(parameter) {
    return request({
        url: "/api/image/detect",
        method: 'get',
        params: parameter
    })
}

export function getLabels(parameter) {
    return request({
        url: "/api/image/labels",
        method: 'get',
        params: parameter
    })
}
