import React, { Consumer, Context, createContext, FC, ProviderProps, useContext, useState } from 'react';

export type BaseConfigurableContextType = Record<any, any>;
export type ConfigContextChangeHandler<T extends BaseConfigurableContextType> = ((newValue: T) => void) | undefined;

export interface ConfigurableContext<T extends BaseConfigurableContextType> {
  ValueContext: Context<T>;
  ConfigContext: Context<ConfigContextChangeHandler<T>>;
  Consumer: Consumer<T>;
  Provider: FC<ProviderProps<T>>;
}

export const createConfigurableContext = <T extends BaseConfigurableContextType>(
  defaultValue: T
): ConfigurableContext<T> => {
  const ValueContext = createContext<T>(defaultValue);
  const { Consumer, Provider } = ValueContext;
  const ConfigContext = createContext<ConfigContextChangeHandler<T>>(undefined);
  const { Provider: ConfigProvider } = ConfigContext;
  const EnhancedValueProvider: FC<ProviderProps<T>> = ({ value, children, ...other }) => {
    const [configurableValue, setConfigurableValue] = useState<T>(value);

    return (
      <Provider value={configurableValue} {...other}>
        <ConfigProvider value={setConfigurableValue}>{children}</ConfigProvider>
      </Provider>
    );
  };

  return {
    ValueContext,
    ConfigContext,
    Consumer,
    Provider: EnhancedValueProvider,
  };
};

export const useValueContext = <T extends BaseConfigurableContextType>(
  configurableContext: ConfigurableContext<T>
): T => {
  const { ValueContext } = configurableContext;

  return useContext<T>(ValueContext);
};

export const useConfigContext = <T extends BaseConfigurableContextType>(
  configurableContext: ConfigurableContext<T>
): ConfigContextChangeHandler<T> => {
  const { ConfigContext } = configurableContext;

  return useContext<ConfigContextChangeHandler<T>>(ConfigContext);
};
