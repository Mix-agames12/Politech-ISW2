
// src/Homepage.js
import React from 'react';
import { Carousel, Card, Container, Row, Col, Navbar, Nav, Footer } from 'react-bootstrap';

const Home = () => {
  return (
    <div>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#home">Mi Sitio</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home">Inicio</Nav.Link>
              <Nav.Link href="#features">Características</Nav.Link>
              <Nav.Link href="#contact">Contacto</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Carousel */}
      <Carousel>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/800x400"
            alt="First slide"
          />
          <Carousel.Caption>
            <h3>First slide label</h3>
            <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
          </Carousel.Caption>
        </Carousel.Item>
        <Carousel.Item>
          <img
            className="d-block w-100"
            src="https://via.placeholder.com/800x400"
            alt="Second slide"
          />
                            <Carousel.Caption>
                                <h3>Second slide label</h3>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                            </Carousel.Caption>
                        </Carousel.Item>
                    </Carousel>

                    {/* Cards */}
                    <Container className="my-4">
                        <Row>
                            <Col>
                                <Card>
                                    <Card.Img variant="top" src="https://via.placeholder.com/150" />
                                    <Card.Body>
                                        <Card.Title>Card title</Card.Title>
                                        <Card.Text>
                                            This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <Card.Img variant="top" src="https://via.placeholder.com/150" />
                                    <Card.Body>
                                        <Card.Title>Card title</Card.Title>
                                        <Card.Text>
                                            This card has supporting text below as a natural lead-in to additional content.{' '}
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col>
                                <Card>
                                    <Card.Img variant="top" src="https://via.placeholder.com/150" />
                                    <Card.Body>
                                        <Card.Title>Card title</Card.Title>
                                        <Card.Text>
                                            This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.
                                        </Card.Text>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>

                    {/* Footer */}
                    <footer className="bg-dark text-white mt-4">
                        <Container fluid className="text-center p-3">
                            <h5>Contacto</h5>
                            <p>Email: contacto@misitio.com</p>
                            <p>Tel: +123 456 7890</p>
                            <h5>Redes Sociales</h5>
                            <p>
                                <a href="#" className="text-white me-2">
                                    <i className="fab fa-facebook"></i>
                                </a>
                                <a href="#" className="text-white me-2">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="#" className="text-white me-2">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </p>
                            <p>&copy; {new Date().getFullYear()} Mi Sitio</p>
                        </Container>
                    </footer>
                </div>
            );
        };

export default Home;

