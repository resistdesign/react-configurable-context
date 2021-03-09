import React, {
  Children,
  Consumer,
  Context,
  createContext,
  FC,
  Key,
  ProviderProps,
  ReactElement,
  useContext,
  useEffect,
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

const DefaultConfigurableContext = createConfigurableContext<any>({});

export const useConfigContext = <T extends BaseConfigurableContextType>(
  configurableContext?: ConfigurableContext<T>
): ConfigContextChangeHandler<T> => {
  const { ConfigContext } = configurableContext || DefaultConfigurableContext;

  return useContext<ConfigContextChangeHandler<T>>(ConfigContext);
};

type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];
type ConfigElement<T extends BaseConfigurableContextType> = ReactElement<
  ConfigProps<T[KeysMatching<T, BaseConfigurableContextType>]>
>;
type SettingElement<T extends BaseConfigurableContextType> = {
  type: keyof T,
  props?: {
    children?: T[keyof T];
  };
  key: Key | null
};

export type ConfigProps<T extends BaseConfigurableContextType> = {
  configurableContext: ConfigurableContext<T>;
  configBranch?: KeysMatching<T, BaseConfigurableContextType>;
  children?: ConfigElement<T> | ConfigElement<T>[] | SettingElement<T> | SettingElement<T>[];
};

export const Config = <T extends BaseConfigurableContextType>({
  configurableContext,
  configBranch,
  children,
}: ConfigProps<T>): ReactElement | null => {
  const {
    ValueContext: {Provider: ValueProvider},
    ConfigContext: { Provider: ConfigProvider },
  } = configurableContext;
  const directValue = useValueContext(configurableContext);
  const setDirectConfigurableValue = useConfigContext(configurableContext);
  const value = useMemo(() => typeof configBranch === 'string' ? typeof directValue === 'object' ? directValue[configBranch] : undefined : directValue, [
    configBranch,
    directValue
  ]);
  const setConfigurableValue = useMemo<ConfigContextChangeHandler<any>>(
    () =>
      typeof configBranch === 'string' ? setDirectConfigurableValue
        ? (newBranchValue: any) => {
            setDirectConfigurableValue({
              ...directValue,
              [configBranch]: newBranchValue,
            });
          }
        : setDirectConfigurableValue: setDirectConfigurableValue,
    [configBranch, directValue, setDirectConfigurableValue]
  );
  const {
    settings,
    otherChildren
  } = useMemo(() => Children.toArray(children).reduce<{settings: Partial<T>, otherChildren: any[]}>((acc, c) => {
    if(typeof c === 'object' && 'type' in c && typeof c.type === 'string'){
      const {
        props: {children: value} = {},
      } = c;

      acc.settings[c.type as keyof T] = value;
    }else{
      acc.otherChildren.push(c);
    }

    return acc;
  }, {settings: {}, otherChildren: []}), [children]);

  useEffect(() => {
    if(setConfigurableValue){
      setConfigurableValue({
        ...value,
        ...settings
      });
    }
  }, [value, setConfigurableValue, settings]);

  return (
    <ConfigProvider value={setConfigurableValue}>
      <ValueProvider value={value as any}>
        {otherChildren}
      </ValueProvider>
    </ConfigProvider>
  );
};

export type SettingProps<T extends BaseConfigurableContextType> = {
  name: keyof T;
  children?: T[keyof T];
};

const c = { thing: 'stuff', other: {} };
const p = (
  <Config configurableContext={createConfigurableContext(c)}>
    <thing>More!</thing>
  </Config>
);
console.log(p);
