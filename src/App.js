import React, { Component } from "react";
import axios from "axios";
import cheerio from "cheerio";
import "bootstrap/dist/css/bootstrap.min.css";

//Bootstrap components
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Alert from "react-bootstrap/Alert";

let ascending = (a,b) => {
  if ( a.numero < b.numero ){
    return -1;
  }
  if ( a.numero > b.numero ){
    return 1;
  }
  return 0;
}

let descending = (a,b) => {
  if ( a.numero > b.numero ){
    return -1;
  }
  if ( a.numero < b.numero ){
    return 1;
  }
  return 0;
}

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      baseUrl: "https://pcel.com/index.php?route=product/search&filter_name=",
      searchParam: "",
      loading: false,
      resultsArray: [],
      numberItems: -1,
      sortingType: "Ascendente",
      errorNumber: "",
      errorParam: ""
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    let isParamError = false
    this.setState({
      loading: true,
    });
    if(this.state.searchParam.split(" ").length > 1){
      isParamError = true
      this.setState({
        errorParam: "Solo debe ser una palabra"
      })
    }
    if(this.state.searchParam.trim() === ""){
      isParamError = true
      this.setState({
        errorParam: "No debe estar vacío"
      })
    }
    if (!isParamError) {
      this.setState({
        errorParam: ""
      })
    }
    let isNumberError = false
    if(this.state.numberItems < 0 || this.state.numberItems > 20){
      isNumberError = true
      this.setState({
        errorNumber: "Debe estar entre 0 y 20"
      })
    }
    if (!isNumberError){
      this.setState({
        errorNumber: ""
      })
    }
    if (isNumberError || isParamError){
      this.setState({
        loading: false
      })
      return
    }
    axios
      .get(`${this.state.baseUrl + this.state.searchParam}`)
      .then((response) => {
        const html = response.data;
        console.log(html);
        const $ = cheerio.load(html);
        let objeto = [];
        let products = [];
        let cadenaConExtra; 
        //Mobile
        /*
          $("div .prod-result")
            .toArray()
            .map((element, i) => {
              if (i>=5){
                return;
              }
              objeto = [];
              objeto.imagen = $(element).find("div > a > img").attr("data-src");
              objeto.titulo = $(element).find("div > a > p").text();
              objeto.precio = $(element).find("div > strong").text();
              return products.push(objeto);
            });
          */
        let encontrados = 0;
        $("tr")
          .toArray()
          .map((element, i) => {
            if (
              !$(element).find("td > div > a > img").attr("src") ||
              encontrados >= this.state.numberItems
            ) {
              return 0;
            }
            encontrados += 1;
            objeto = [];
            objeto.imagen = $(element).find("td > div > a > img").attr("src");
            objeto.titulo = $(element).find("td > div > a").text().replace('.',',').replace(':',',').split(",")[0];
            objeto.precio = $(element).find("td > div.price").text();
            objeto.urlPro = $(element).find("td > div.image > a").attr("href");
            cadenaConExtra = objeto.precio.replace(/\D/g,'')
            objeto.numero = parseInt(cadenaConExtra.substring(0, cadenaConExtra.length -2))
            return products.push(objeto);
          });
        if (this.state.sortingType === "Ascendente") {
          products.sort(ascending)
        } else {
          products.sort(descending)
        }
        console.log(products)
        this.setState({ resultsArray: products, loading: false })
  
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          loading: false,
        });
      });
  };

  render() {
    return (
      <Container>
        <div style={{ marginTop: "30px" }} />
        <Form onSubmit={this.handleSubmit}>
          <Row>
            <Col xs={12} lg={12}>
              <Form.Label>Búsqueda</Form.Label>
              <Form.Control
                onChange={(e) => this.handleChange(e)}
                name="searchParam"
                type="text"
                placeholder="Buscar productos"
              />
              {this.state.errorParam ? 
              <Alert variant={"danger"}>
                {this.state.errorParam}
              </Alert>: ""
            }
            </Col>
            <Col xs={12} lg={6} style={{ paddingTop: "30px" }}>
              <Form.Label>Número de items</Form.Label>
              <Form.Control
                onChange={(e) => this.handleChange(e)}
                name="numberItems"
                type="number"
                placeholder="Número de items a buscar"
              />
              {this.state.errorNumber ? 
              <Alert variant={"danger"}>
                {this.state.errorNumber}
              </Alert>: ""
            }
            </Col>
            <Col xs={12} lg={6} style={{ paddingTop: "30px" }}>
              <Form.Label>Ordenar por precio</Form.Label>
              <Form.Control
                as="select"
                onChange={(e) => this.handleChange(e)}
                name="sortingType"
              >
                <option>Ascendente</option>
                <option>Descendente</option>
              </Form.Control>
            </Col>
            <Col xs={12} lg={2} style={{ paddingTop: "20px" }}>
              <Button
                disabled={this.state.loading}
                type="submit"
                style={{ width: "100%" }}
              >
                Buscar
              </Button>
            </Col>
          </Row>
        </Form>
        <Row style={{ marginTop: "50px" }}>
          {this.state.loading ? (
            <Col xs={12} lg={12}>
              <img
                className="rounded mx-auto d-block"
                src="https://media1.tenor.com/images/556e9ff845b7dd0c62dcdbbb00babb4b/tenor.gif?itemid=5345658"
                alt="Loadin gif"
              />
            </Col>
          ) : (
            <Col xs={12} lg={12}>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.resultsArray.map((producto, i) => (
                    <tr key={i + 1}>
                      <td>
                        <img src={producto.imagen} alt="Foto Producto" />
                      </td>
                      <td><a rel="noreferrer" target="_blank" href={producto.urlPro}>{producto.titulo}</a></td>
                      <td>{producto.precio}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Col>
          )}
        </Row>
      </Container>
    );
  }
}

export default App;
