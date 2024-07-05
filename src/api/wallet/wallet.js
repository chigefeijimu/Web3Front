import request from '@/utils/request'

// 查询钱包管理列表
export function listWallet(query) {
  return request({
    url: '/wallet/wallet/list',
    method: 'get',
    params: query
  })
}

// 查询钱包管理详细
export function getWallet(id) {
  return request({
    url: '/wallet/wallet/' + id,
    method: 'get'
  })
}

// 新增钱包管理
export function addWallet(data) {
  return request({
    url: '/wallet/wallet/add',
    method: 'post',
    data: data
  })
}

// 修改钱包管理
export function updateWallet(data) {
  return request({
    url: '/wallet/wallet/edit',
    method: 'put',
    data: data
  })
}

// 删除钱包管理
export function delWallet(id) {
  return request({
    url: '/wallet/wallet/' + id,
    method: 'delete'
  })
}
