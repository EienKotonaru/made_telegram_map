import React from "react"
import './style.css'
import {
    Navbar,
    NavbarBrand,
} from 'reactstrap';


export default class Navigation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
        };
        this.toggle = this.toggle.bind(this)

    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        return (
            <Navbar color="dark" dark expand="md">
                <NavbarBrand href="/">Telegram map</NavbarBrand>
            </Navbar>

        );
    }
}