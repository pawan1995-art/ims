import { Col, Row } from 'antd';
import MonthlyChart from '../components/Charts/MonthlyChart';
import Loader from '../components/Loader';
import { useCountProductsQuery } from '../redux/features/management/productApi';
import { useYearlySaleQuery } from '../redux/features/management/saleApi';
import DailyChart from '../components/Charts/DailyChart';

const Dashboard = () => {
  const { data: products, isLoading: loadingProducts } = useCountProductsQuery(undefined);
  const { data: yearlyData, isLoading: loadingSales } = useYearlySaleQuery(undefined);

  const isLoading = loadingProducts || loadingSales;
  
  if (isLoading) return <Loader />;

  // Safely handle and reduce yearly data
  const totalSold = yearlyData?.data?.reduce(
    (acc: number, cur: { totalQuantity?: number }) => acc + (cur.totalQuantity ?? 0),
    0
  ) ?? 0;

  const totalRevenue = yearlyData?.data?.reduce(
    (acc: number, cur: { totalRevenue?: number }) => acc + (cur.totalRevenue ?? 0),
    0
  ) ?? 0;

  const totalStock = products?.data?.totalQuantity ?? 0;

  return (
    <>
      <Row style={{ paddingRight: '1rem' }}>
        <Col xs={24} lg={8} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Stock</h3>
            <h1>{totalStock}</h1>
          </div>
        </Col>
        <Col xs={24} lg={8} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Item Sold</h3>
            <h1>{totalSold}</h1>
          </div>
        </Col>
        <Col xs={24} lg={8} style={{ padding: '.5rem' }}>
          <div className='number-card'>
            <h3>Total Revenue</h3>
            <h1>₹{totalRevenue}</h1>
          </div>
        </Col>
      </Row>

      <div style={{ border: '1px solid gray', margin: '1rem', padding: '1rem', borderRadius: '10px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Daily Sale and Revenue</h1>
        <DailyChart />
      </div>

      <div style={{ border: '1px solid gray', margin: '1rem', padding: '1rem', borderRadius: '10px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '.5rem' }}>Monthly Revenue</h1>
        <MonthlyChart />
      </div>
    </>
  );
};

export default Dashboard;
