import React from "react"
import './style.css'
import {
    Container,
    Button,
    Spinner, Form, FormGroup, Row, Col, Input,
} from 'reactstrap';
import './style.css'

import {
    useParams
} from "react-router-dom";
import Header from "../Header";
import Plotly from "plotly.js-basic-dist";
import createPlotlyComponent from "react-plotly.js/factory";

function PageCaptionMatch() {
    return <Header text={"Поиск связанных telegram каналов"}/>;
}

function ButtonCallMatch(props) {
    let {matchId} = useParams();
    return <Button
        size={'lg'}
        onClick={() => props.sender(matchId - 1)}
        color="secondary"
        disabled={!props.channelLoaded}
    >
        Получить результат
    </Button>
}


export default class GetSubgraph extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isError: false,
            isShown: false,
            plotlyGraph: "",
            dataChanged: false,
            dataWasReceived: false,
            dataWasSend: false,
            hero_prefix: "",
            hero_num: -1,
            channelLoaded: false,
            channel_in_base: false
        };
        this.fieldChange = this.fieldChange.bind(this);
    }

    setFieldsToState(e) {
        this.setState({
            [e.target.name]: e.target.value,
            dataChanged: true,
        });
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(100);
            }, 200)
        });
    }

    fieldChange(value) {
        this.setFieldsToState(value);
    }

    handleChange = (e) => {
        this.setState({channel: e.target.value});
        this.setState({
                        channelLoaded: true
                    });
    }

    sendData = () => {
        this.setState({
            dataWasSend: true,
            dataWasReceived: false
        })

        let options = {
            headers: {
                'Accept': 'application/json',
            },
            method: 'POST'
        };
        options.body = JSON.stringify({
            'channel': this.state.channel,
        })

        fetch('/api/get_subgraph', options)
            .then((response) => {
                if (response.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        response.status);
                    this.setState({
                        isError: true
                    });
                    return;
                }
                return response.json();
            })
            .then((data) => {
                if (!this.state.isError) {
                    this.setState({
                        channel_in_base: data.channel_in_base,
                        plotlyGraph: data.plotly_graph,
                        dataWasReceived: true,
                        dataWasSend: false,
                    })
                }
            })
            .catch((err) => {
                console.log('Fetch Error:', err);
            });
    }

    changeEndpoint(endpoint) {
        window.location = '/' + endpoint
    }

    componentDidMount() {

    }

    render() {
        const Plot = createPlotlyComponent(Plotly);
        return (
            <Container>
                <PageCaptionMatch/>
                <Form>
                    <FormGroup>
                        <Row>
                            <Col>
                                <Input type="text" name="name" id="channel" autoComplete="new-password"
                                       onChange={this.handleChange}/>
                            </Col>
                        </Row>
                    </FormGroup>
                </Form>

                <div className={"center-text"}>
                    <ButtonCallMatch sender={this.sendData}
                    channelLoaded={this.state.channelLoaded}/>
                </div>

                <br/>
                {this.state.dataWasSend ? <Spinner color="info"/> : <></>}
                {this.state.dataWasReceived & this.state.channel_in_base ? <div>
                    <Plot
                        data={this.state.plotlyGraph.data}
                        layout={this.state.plotlyGraph.layout}
                    />
                </div> : <></>}
                {this.state.dataWasReceived & !this.state.channel_in_base ? <h3>Канал не найден. Попробуйте указать другой</h3>: <></>}
            </Container>
        );
    }
}
