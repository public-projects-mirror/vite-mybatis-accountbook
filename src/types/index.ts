// 账单相关类型
export interface Transaction {
  id: string
  amount: number
  category: string
  type: '收入' | '支出'
  remarks: string
  date: string
}

// 类别相关类型
export interface Category {
  id: string
  categoryName: string
  createTime: string
  updateTime: string
}

// API请求相关类型
export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface AddAccountRequest {
  amount: number
  category: string
  type: string
  remarks: string
  date: string
} 