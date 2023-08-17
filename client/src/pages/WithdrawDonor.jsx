
import React, { useEffect, useState } from 'react'
import { useStateContext } from '../context'
import { FundCard, Loader } from '../components';
import { v4 as uuidv4 } from "uuid";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function WithdrawDonor() {
    const [isLoading, setIsLoading] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const { address, contract, getUserCampaigns, withdrawFundDonator} = useStateContext();

    const fetchCampaigns = async () => {
        setIsLoading(true);
        const data = await getUserCampaigns();
        setCampaigns(data);
        setIsLoading(false);
      }


    const WithdrawFundByDonor = async (id) => {
        try {
            setIsLoading(true);
            await withdrawFundDonator(id)
            setIsLoading(false)
        } catch (error) {
            console.log(error);
        }
    }
    

    useEffect(() => {
        if(contract) fetchCampaigns();
      }, [address, contract]);
  return (
    <div>
    {isLoading && <Loader />}
    
      <h1 className="font-epilogue font-semibold text-[18px] text-white text-left">Withdraw Funds By Donor ({campaigns.length})</h1>
        
        <div className="flex flex-wrap mt-[20px] gap-[26px]">
        {!isLoading && campaigns.length > 0 && campaigns.map((campaign) => {
          return(
          <div className="flex flex-wrap mt-[20px] gap-[26px]" key={uuidv4()}>
            <FundCard 
          key={uuidv4()}
          {...campaign}
          handleClick={()=>WithdrawFundByDonor(campaign.pId)}
        />
          </div>
          )
        
      }
        )}
        </div>
        <ToastContainer />
       
    </div>
  )
}

export default WithdrawDonor