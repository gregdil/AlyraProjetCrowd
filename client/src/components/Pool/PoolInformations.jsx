import React from 'react';

export default class PoolInformations extends React.Component {

    render(){
        
        let informations = this.props.informations;

        return(
            <div className='row'>
                    <div className='col-12'>
                        <h2 className="top-card-title">Pool information</h2>
                        <div className="card">
                            <div className="card-body">
                                <div className='row'>
                                    <div className='col-4'>
                                        <h3>Total amount stacked</h3>
                                        <p><span className="amount">{informations.totalStake}</span><span className="currency"> Eth</span></p>
                                    </div>
                                    <div className='col'>
                                        <h3>Stakers in pool</h3>
                                       <p><span className="amount">{informations.stakersInPool}</span><span className="currency"> Stackers</span></p> 
                                    </div>
                                    <div className='col'>
                                        <h3>Annual reward rate</h3>
                                       <p><span className="amount">{informations.annualRewardRate}%</span></p> 
                                    </div>
                                    <div className='col'>
                                        <h3>Cooldown period</h3>
                                       <p><span className="amount">{informations.cooldown}</span><span className="currency">s</span></p> 
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
        )
    }

}
