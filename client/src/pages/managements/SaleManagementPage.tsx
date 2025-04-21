// src/pages/managements/SaleManagementPage.tsx
import { DeleteFilled, EditFilled } from '@ant-design/icons';
import type { PaginationProps, TableColumnsType } from 'antd';
import { Button, Modal, Pagination, Table } from 'antd';
import { Flex } from 'antd';
import { useState } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import SearchInput from '../../components/SearchInput';
import toastMessage from '../../lib/toastMessage';
import { useDeleteSaleMutation, useGetAllSaleQuery } from '../../redux/features/management/saleApi';
import { IProduct } from '../../types/product.types';
import { ITableSale } from '../../types/sale.type';
import formatDate from '../../utils/formatDate';

const SaleManagementPage = () => {
  
  const [query, setQuery] = useState({ page: 1, limit: 10, search: '' });
  const { data, isFetching } = useGetAllSaleQuery(query);

  const onChange: PaginationProps['onChange'] = (page) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const tableData = data?.data?.map((sale: ITableSale) => ({
    key: sale._id,
    productName: sale.productName,
    productPrice: sale.productPrice,
    buyerName: sale.buyerName,
    quantity: sale.quantity,
    totalPrice: sale.totalPrice,
    date: formatDate(sale.date),
  }));

  const columns: TableColumnsType<any> = [
    { title: 'Product Name',   key: 'productName', dataIndex: 'productName' },
    { title: 'Product Price',  key: 'productPrice', dataIndex: 'productPrice', align: 'center' },
    { title: 'Buyer Name',     key: 'buyerName',    dataIndex: 'buyerName',    align: 'center' },
    { title: 'Quantity',       key: 'quantity',     dataIndex: 'quantity',     align: 'center' },
    { title: 'Total Price',    key: 'totalPrice',   dataIndex: 'totalPrice',   align: 'center' },
    { title: 'Selling Date',   key: 'date',         dataIndex: 'date',         align: 'center' },
    {
      title: 'Action',
      key: 'x',
      align: 'center',
      width: '1%',
      render: (item) => (
        <div style={{ display: 'flex' }}>
          <UpdateModal product={item} />
          <DeleteModal id={item.key} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Flex justify='end' style={{ margin: '5px', gap: 4 }}>
        <SearchInput setQuery={setQuery} placeholder='Search Sold Products...' />
      </Flex>

      <Table
        size='small'
        loading={isFetching}
        columns={columns}
        dataSource={tableData}
        pagination={false}
      />

      <Flex justify='center' style={{ marginTop: '1rem' }}>
        <Pagination
          current={query.page}
          onChange={onChange}
          defaultPageSize={query.limit}
          total={data?.meta?.total}
        />
      </Flex>
    </>
  );
};

/**
 * Update Modal
 */
const UpdateModal = ({ product }: { product: IProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleSubmit } = useForm();

  const onSubmit = (data: FieldValues) => {
    console.log({ product, data });
    // TODO: wire up your update mutation here
  };

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  return (
    <>
      <Button
        onClick={showModal}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'green' }}
      >
        <EditFilled />
      </Button>

      <Modal title='Update Product Info' open={isModalOpen} onCancel={handleCancel} footer={null}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1>Working on it...!!!</h1>
          <Button htmlType='submit'>Submit</Button>
        </form>
      </Modal>
    </>
  );
};

/**
 * Delete Modal
 */
const DeleteModal = ({ id }: { id: string }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteSale] = useDeleteSaleMutation();

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteSale(id).unwrap();
      toastMessage({ icon: 'success', text: res.message });
      setIsModalOpen(false);
    } catch (error: any) {
      setIsModalOpen(false);
      toastMessage({ icon: 'error', text: error.data?.message || 'Delete failed' });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        type='primary'
        className='table-btn-small'
        style={{ backgroundColor: 'red' }}
      >
        <DeleteFilled />
      </Button>

      <Modal title='Delete Product' open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Are you sure you want to delete this product?</h2>
          <h4>You won't be able to revert it.</h4>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            <Button onClick={() => setIsModalOpen(false)} type='primary' style={{ backgroundColor: 'lightseagreen' }}>
              Cancel
            </Button>
            <Button onClick={() => handleDelete(id)} type='primary' style={{ backgroundColor: 'red' }}>
              Yes! Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SaleManagementPage;
