import React from 'react';

export default class Transactions extends React.Component {

    render(){
        return(
            <div className='row'>
                <div className='col-12'>
                    <h2 className="top-card-title">Your transactions</h2>

                    <div className="card">
                        <div className="card-body">
                            <div className='row'>
                                <div className='col-12'>
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Action</th>
                                                <th className="text-end">Amount Stacked</th>
                                                <th className="text-end">Rewards</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.props.transactions.map((transaction, index) => (
                                            <tr key={index}>
                                                <td>{transaction.timestampFormatted}</td>
                                                <td>{transaction.action}</td>
                                                <td className="text-end">{transaction.amountStacked}</td>
                                                <td className="text-end">{transaction.rewards}</td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
                
        )
    }

}
