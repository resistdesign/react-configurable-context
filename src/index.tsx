import React, {
  Context,
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

export type BaseContextType = Record<any, any>;

export type ConfigurableContextSetter<ContextType extends BaseContextType> = (value: ContextType) => void;
export type ConfigurableContextPropSetter<ContextType extends BaseContextType> = (
  name: keyof ContextType,
  value: ContextType[keyof ContextType]
) => void;

export type ConfigurableContextContextType<ContextType extends BaseContextType> = Map<
  Context<ContextType>,
  ConfigurableContextSetter<ContextType>
>;

export const ConfigurableContextContext = createContext<ConfigurableContextContextType<BaseContextType> | undefined>(
  undefined
);
const { Provider: ConfigurableContextContextProvider } = ConfigurableContextContext;

export type ConfigurableContextProps<ContextType extends BaseContextType> = {
  context: Context<ContextType>;
  defaultValue: ContextType | undefined;
};

export const ConfigurableContext: FC<ConfigurableContextProps<BaseContextType>> = <
  ContextType extends BaseContextType
>({
  context,
  defaultValue,
  children,
}: PropsWithChildren<ContextType>) => {
  const { Provider } = context;
  const configurableContextMap: ConfigurableContextContextType<ContextType> =
    useContext<ConfigurableContextContextType<ContextType>>(
      ConfigurableContextContext as Context<ConfigurableContextContextType<ContextType>>
    ) || new Map<Context<ContextType>, ConfigurableContextSetter<ContextType>>();
  const [value, setValue] = useState<ContextType | undefined>(
    typeof defaultValue === 'undefined' ? useContext<ContextType>(context) : defaultValue
  );
  const contextValueSetter = configurableContextMap.get(context) || setValue;

  configurableContextMap.set(context, contextValueSetter);

  return (
    <Provider value={value}>
      <ConfigurableContextContextProvider value={configurableContextMap}>{children}</ConfigurableContextContextProvider>
    </Provider>
  );
};

export default ConfigurableContext;

export type ConfigProps<ContextType extends BaseContextType> = {
  context: Context<ContextType>;
};

const ConfigContext = createContext<ConfigurableContextPropSetter<BaseContextType> | undefined>(undefined);
const { Provider: ConfigProvider } = ConfigContext;

export const Config: FC<ConfigProps<BaseContextType>> = <ContextType extends BaseContextType>({
  context,
  children,
}: PropsWithChildren<ContextType>) => {
  const configurableContextMap: ConfigurableContextContextType<ContextType> = useContext<
    ConfigurableContextContextType<ContextType>
  >(ConfigurableContextContext as Context<ConfigurableContextContextType<ContextType>>);
  const currentValue = useContext<ContextType>(context);
  const setter = configurableContextMap ? configurableContextMap.get(context) : undefined;
  const propSetter = useCallback<ConfigurableContextPropSetter<ContextType>>(
    (name, value) => {
      if (setter) {
        setter({
          ...currentValue,
          [name]: value,
        });
      }
    },
    [setter, currentValue]
  );

  return <ConfigProvider value={propSetter}>{children}</ConfigProvider>;
};

export type SettingProps = {
  name: string;
  children: any;
};

export const Setting: FC<SettingProps> = ({ name, children }) => {
  const propSetter = useContext<ConfigurableContextPropSetter<any> | undefined>(ConfigContext);

  useEffect(() => {
    if (propSetter) {
      propSetter(name, children);
    }
  }, [propSetter, name, children]);

  return null;
};
