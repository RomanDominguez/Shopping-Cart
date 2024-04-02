import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import './index.css';

// simulate getting products from DataBase
const products = [
  { name: "Apple",       country: "Mexico", cost: 2.75, inStock: 10 },
  { name: "Avocado",     country: "Mexico", cost: 3.03, inStock: 20 },
  { name: "Banana",      country: "Mexico", cost: 4.16, inStock: 30 },
  { name: "Blueberry",   country: "Mexico", cost: 5.45, inStock: 40 },
  { name: "Cherry",      country: "USA",    cost: 2.78, inStock: 10 },
  { name: "Coconut",     country: "USA",    cost: 3.69, inStock: 20 },
  { name: "Cranberry",   country: "USA",    cost: 4.05, inStock: 30 },
  { name: "Dragonfruit", country: "USA",    cost: 5.15, inStock: 40 },
];



const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    console.log("useEffect Called");
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        console.log("FETCH FROM URl");
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [items, setItems] = React.useState(products);
  const [cart,  setCart ] = React.useState([]);
  
  
  //  Fetch Data
  
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data,  }, doFetch] = useDataApi("http://localhost:1337/api/products",
    {
      data: [],
    }
  );
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    let item = items.filter((item) => item.name === name);
    if (item[0].inStock === 0) return;
    item[0].inStock = item[0].inStock -1;
    console.log(`add to Cart ${JSON.stringify(item)}`);
      setCart([...cart, ...item]);
    };

  const deleteCartItem = (delIndex) => {
      // this is the index in the cart not in the Product List
      let newCart = cart.filter((item, i) => delIndex !== i);
      let target = cart.filter((item, index) => delIndex === index);
      let newItems = items.map((item, index) => {
        if (item.name === target[0].name) item.inStock = item.inStock + 1;
        return item;
      });
      setCart(newCart);
      setItems(newItems);
    };
  const photos = ["Apple.png", "Avocado.png", "Banana.png", "Blueberry.png", "Cherry.png", "Coconut.png", "Cranberry.png", "Dragonfruit.png"];

  let list = items.map((item, index) => {

  

    return (
      <li key={index}>
        <Image src={photos[index % 8]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {item.name}: ${item.cost} in Stock = {item.inStock}
        </Button>
        <input name={item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });

  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // Implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    let newItems = data.data.map((item) => {
      let { name, country, cost, inStock } = item.attributes;  //fixed
      return { name, country, cost, inStock };
    });
    setItems([...newItems]);
  };
  console.log(data.data[0]);
  console.log(items);

  return (
    <Container>
      <Row>
        <Col>
          <h2>Product List</h2>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h2>Cart Contents</h2>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h2>CheckOut </h2>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(`http://localhost:1337/api/${query}`);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};


// ========================================

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Products />,
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
