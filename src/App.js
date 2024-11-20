import { Toaster } from 'react-hot-toast';
import ProductListTable from './pages/product/Products';

function App() {
  return (
    <div style={{ padding: 10, margin: 10 }}>
      <Toaster />
      <ProductListTable />
    </div>
  );
}

export default App;
