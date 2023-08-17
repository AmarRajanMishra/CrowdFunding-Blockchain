import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useStateContext } from '../context'
import { FundCard, Loader } from '../components';
import { v4 as uuidv4 } from "uuid";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



function WithdrawOwner() {
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const navigate = useNavigate();
    const { address, contract, getUserCampaigns, withdrawCampaignOwner } = useStateContext();

    const fetchCampaigns = async () => {
        setIsLoading(true);
        const data = await getUserCampaigns();
        setCampaigns(data);
        setIsLoading(false);
      }

    
    const withdrawFunds = async(id) =>{
            try {
              setIsLoading(true);
              await withdrawCampaignOwner(id); 
              setIsLoading(false);
            } catch (error) {
             
              setIsLoading(false);
            }
    }

    useEffect(() => {
        if(contract) fetchCampaigns();
      }, [address, contract]);
  return (

    <div>
    <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">Withdraw Funds By Owner ({campaigns.length})</h1>
    
    {isLoading && <Loader />}
    
      
        <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {!isLoading && campaigns.length > 0 && campaigns.map((campaign) => {
          return(
          <div className="flex flex-wrap mt-[20px] gap-[26px]" key={uuidv4()}>
            <FundCard 
          key={uuidv4()}
          {...campaign}
          handleClick={()=>withdrawFunds(campaign.pId)}
        />
          </div>)
        
      }
        )}
        </div>
        
        <ToastContainer />
       
    </div>
  )
}

export default WithdrawOwner