# Listagem de Entidades

## User

```ts
type User = {
  id: string;
  email: string;
  password: string;
};
```

## Store

```ts
type Store = {
  id: string;
  name: string;
  owner_user_id: string;
};
```

## Product

```ts
type Product = {
  id: string;
  name: string;
  category_id: string;
  store_id: string;
  price: number;
  image_url: string;
};
```

## Category

```ts
type Category = {
  id: string;
  name: string;
  image_url: string;
  store_id: string;
};
```

## Ads

```ts
type Ad = {
  id: string;
  image_url: string;
  store_id: string;
  product_id: string; //Product Id to Redirect
};
```

## Cart

```ts
type Cart = {
  id: string;
  user_id: string;
  store_id: string;
  delivery_address: string;
  payment_method_id: string;
  shipping_id: string;
  coupon_id?: string;
  prices: {
    subtotal: number;
    shipping: number;
    coupon_discount: number;
    total: number;
  };
};
```

## CartProduct

```ts
type CartProduct = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
};
```

## Shipping

```ts
type Shipping = {
  id: string;
  store_id: string;
  name: string;
  price: number;
  delivery_time: number; // in milliseconds;
};
```

## PaymentMethod

```ts
type PaymentMethod = {
  id: string;
  store_id: string;
  name: string;
};
```

## Coupon

```ts
type Coupon = {
  id: string;
  store_id: string;
  name: string;
  discount: number; // in percentage
};
```

## Order

```ts
type Order = {
  id: string;
  cart_id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'canceled';
};
```

## Notification

```ts
type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Date;
  metadata: {
    type: string; //Code of notification
    ...//Util data of type
  }
};
```

# Features

## Busca de Categorias e Produtos

Usando um FullText Search, devo retornar um array de categorias e produtos que contenham o termo buscado.

## Listar Notificações de Usuário
