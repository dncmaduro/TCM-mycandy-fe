# Organization Tree Component

## Mô tả

Component `OrganizationTree` hiển thị cấu trúc phân cấp quản lý dưới dạng cây tổ chức (organizational chart).

## Tính năng

### 1. **Hiển thị dạng cây phân cấp**

- Tự động xây dựng cấu trúc cây từ dữ liệu quan hệ manager-employee
- Hiển thị các cấp quản lý từ trên xuống dưới
- Tìm các root nodes (managers không phải là employee của ai)

### 2. **UI/UX đẹp mắt**

- Card hiển thị thông tin người dùng với avatar, tên, ID
- Badge hiển thị số lượng nhân viên trực thuộc
- Đường kẻ nối giữa các nodes để thể hiện mối quan hệ
- Hover effect với scale và shadow
- Responsive design cho mobile

### 3. **Tích hợp với tabs**

- Tab "Dạng bảng": Hiển thị dữ liệu dạng bảng với DataTable
- Tab "Cây phân cấp": Hiển thị dạng cây tổ chức với OrganizationTree

## Cấu trúc dữ liệu

```typescript
type ManagementRelation = {
  manager: {
    _id: string
    name?: string
    avatarUrl?: string
  }
  employee: {
    _id: string
    name?: string
    avatarUrl?: string
  }
}
```

## Thuật toán xây dựng cây

1. **Khởi tạo**: Tạo Map lưu tất cả profiles với employees = []
2. **Xây dựng quan hệ**: Duyệt qua managements, thêm employee vào manager.employees
3. **Tìm root nodes**: Tìm các managers không phải là employee của ai (không có trong employeeIds)
4. **Render đệ quy**: Render từng node và các con của nó

## Cải tiến CSS

- Sử dụng CSS pseudo-elements (::before, ::after) để vẽ đường kẻ nối
- Màu sắc theo theme Mantine (indigo palette)
- Responsive: Chuyển sang dạng cột trên mobile
- Z-index để card luôn hiển thị trên đường kẻ

## Sử dụng

```tsx
<OrganizationTree managements={managements} profiles={profilesList} />
```

## Props

- `managements`: Mảng các quan hệ manager-employee
- `profiles`: Mảng tất cả profiles để lấy thông tin đầy đủ
