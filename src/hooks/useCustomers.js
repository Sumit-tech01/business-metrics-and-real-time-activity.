import { useMemo } from 'react';
import { useCollection } from './useCollection';
import {
  createCustomer,
  deleteCustomer,
  normalizeCustomers,
  updateCustomer,
} from '../services/customersService';

export const useCustomers = () => {
  const resource = useCollection('customers', {
    mapData: normalizeCustomers,
    createFn: createCustomer,
    updateFn: updateCustomer,
    removeFn: deleteCustomer,
    entityName: 'Customer',
  });

  const activeCustomers = useMemo(
    () => resource.items.filter((item) => item.status === 'active').length,
    [resource.items],
  );

  const customerNames = useMemo(
    () => resource.items.map((item) => item.name).filter(Boolean),
    [resource.items],
  );

  return {
    ...resource,
    customers: resource.items,
    activeCustomers,
    customerNames,
  };
};
