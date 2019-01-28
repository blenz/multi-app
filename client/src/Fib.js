import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
    state = {
        seenIndexes: [],
        values: {},
        index: ''
    };

    componentDidMount() {
        this.fetchValues();
        this.fetchIndexes();
    }

    async fetchValues() {
        const values = await axios.get('/api/values/current');
        this.setState({ values: values.data });
    }

    async fetchIndexes() {
        const seenIndexes = await axios.get('/api/values/all');
        this.setState({ seenIndexes: seenIndexes.data });
    }

    handleSubmit = async event => {
        event.preventDefault();

        await axios.post('/api/values', {
            index: this.state.index
        });

        this.setState({ index: '' });
        this.fetchIndexes();
        this.fetchValues();
    };

    handleReset = async event => {
        event.preventDefault();

        console.log('derpy1');
        await axios.get('/api/values/clear');

        console.log('derpy2');

        this.setState({ 
            seenIndexes: [],
            values: {},
        });
    };

    renderSeenIndexes() {
        return this.state.seenIndexes
            .map(({ number }) => number).join(', ');
    }

    renderValues() {
        const entries = [];

        for (let key in this.state.values) {
            entries.push(
                <div key={ key }>
                    For index { key }, I calculated {this.state.values[key]}
                </div>
            );
        }

        return entries;
    }

    render() {
        return (
            <div className="container text-center my-5">
                <form 
                    onSubmit={this.handleSubmit}
                    onReset={this.handleReset}>
                    <label>Enter index:</label>
                    <input
                        type="number"
                        value={this.state.index}
                        onChange={event => this.setState({ index: event.target.value })} 
                    />
                    <button type="submit" value="Submit">Submit</button>
                    <button type="reset" value="Reset">Reset</button>
                </form>

                <h3>Seen Indexes:</h3>
                {this.renderSeenIndexes()}

                <h3>Calculated Values:</h3>
                {this.renderValues()}
            </div>
        );
    }
}

export default Fib;