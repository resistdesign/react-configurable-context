import React, { Context, createContext, FC, PropsWithChildren, useContext, useState } from 'react';

export type BaseContextType = Record<any, any>;

export type ConfigurableContextSetter<ContextType extends BaseContextType> = (value: ContextType) => void;

export type ConfigurableContextContextType<ContextType extends BaseContextType> = Map<
  Context<ContextType>,
  ConfigurableContextSetter<ContextType>
>;

export const ConfigurableContextContext = createContext<ConfigurableContextContextType<BaseContextType> | undefined>(
  undefined
);

export const {
  Consumer: ConfigurableContextContextConsumer,
  Provider: ConfigurableContextContextProvider,
} = ConfigurableContextContext;

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
