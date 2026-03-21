import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import MainView from './pages/MainView';
import ItemList from './pages/ItemList';
import LabView from './pages/LabView';
import EditUnit from './pages/EditUnit';
import EditItem from './pages/EditItem';

import UnitDetails from './pages/UnitDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainView />} />
        <Route path="items" element={<ItemList />} />
        <Route path="lab" element={<LabView />} />
        <Route path="unit/:id" element={<UnitDetails />} />
        <Route path="edit-unit" element={<EditUnit />} />
        <Route path="edit-unit/:id" element={<EditUnit />} />
        <Route path="edit-item" element={<EditItem />} />
        <Route path="edit-item/:id" element={<EditItem />} />
      </Route>
    </Routes>
  );
}

export default App;

