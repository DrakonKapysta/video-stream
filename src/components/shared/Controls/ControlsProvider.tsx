import React from "react";

interface ControlContextProps {}

interface ControlProviderProps {
  children: React.ReactNode;
}

const ControlContext = React.createContext<ControlContextProps>(null!);

const useControlsContext = () => {
  const props = React.useContext(ControlContext);
  if (!props) {
    throw new Error("ControlProvider not found");
  }

  return props;
};

const ControlsProvider: React.FC<ControlProviderProps> = ({ children }) => {
  return (
    <ControlContext.Provider value={{}}>{children}</ControlContext.Provider>
  );
};

const Controls = Object.assign(ControlsProvider, {});
Controls.displayName = "Controls";

export { useControlsContext, ControlContext, Controls };
