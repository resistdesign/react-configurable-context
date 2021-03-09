import React, {
  Consumer,
  Context,
  createContext,
  FC,
  PropsWithChildren,
  ProviderProps,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react';

export type BaseConfigurableContextType = Record<any, any>;
export type ConfigContextChangeHandlerSignature<T extends BaseConfigurableContextType> = (newValue: T) => void;
export type ConfigContextChangeHandler<T extends BaseConfigurableContextType> =
  | ConfigContextChangeHandlerSignature<T>
  | undefined;

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

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type ConfigProps<T extends BaseConfigurableContextType> = {
  configurableContext: ConfigurableContext<T>;
  configBranch?: KeysMatching<T, BaseConfigurableContextType>;
};

export const Config = <T extends BaseConfigurableContextType>({
  configurableContext,
  configBranch,
  children,
}: PropsWithChildren<ConfigProps<T>>): ReactElement | null => {
  const {
    ConfigContext: { Provider: ConfigProvider },
  } = configurableContext;
  const value = useValueContext(configurableContext);
  const setDirectConfigurableValue = useConfigContext(configurableContext);
  const setConfigurableValue = useMemo<ConfigContextChangeHandler<any>>(
    () =>
      typeof configBranch === 'string' && configBranch && setDirectConfigurableValue
        ? (newBranchValue: any) => {
            setDirectConfigurableValue({
              ...value,
              [configBranch]: newBranchValue,
            });
          }
        : setDirectConfigurableValue,
    [configBranch, value, setDirectConfigurableValue]
  );

  return <ConfigProvider value={setConfigurableValue}>{children}</ConfigProvider>;
};
