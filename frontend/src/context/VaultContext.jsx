import * as React from 'react';
import { api } from '../api/client';

const VaultContext = React.createContext(null);

export function VaultProvider({ children }) {
  const [sites, setSites] = React.useState(null); // null=loading, undefined=error, []=empty
  const [error, setError] = React.useState('');

  const load = React.useCallback(() => {
    setError('');
    return api
      .listSites()
      .then((data) => setSites(data))
      .catch((e) => {
        setSites(undefined);
        setError(e.message);
      });
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const value = React.useMemo(
    () => ({ sites, error, load, setError }),
    [sites, error, load],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  return React.useContext(VaultContext); // null if outside provider
}