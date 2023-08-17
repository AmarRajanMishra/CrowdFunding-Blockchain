import React, { useContext, createContext, useState, useEffect } from 'react';

import { useAddress, useContract, useMetamask, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { EditionMetadataWithOwnerOutputSchema } from '@thirdweb-dev/sdk';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const [isWithdraw, setIsWithdraw] = useState(false)
  const { contract } = useContract('0x42C44A68749b74144E779BC99Cf814f06DD20052');
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useMetamask();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({
				args: [
					address, // owner
					form.title, // title
					form.description, // description
					form.target,
					new Date(form.deadline).getTime(), // deadline,
					form.image,
				],
			});

      console.log("contract call success", data)
    } catch (error) {
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    try {
      if(!isWithdraw){
        const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});
        return data;
        
      }else{
        alert(`Can't Donate to this Campaign`)
      }
      
    } catch (error) {
      console.log(error);
    }
    
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }

  const withdrawCampaignOwner = async (pId) => {
    
    try {
      const data = await contract.call('withdrawCampaignOwner', [pId]);
      toast('Withdraw Successful')
      setIsWithdraw(true)
      localStorage.setItem('iswithdraw', JSON.stringify(true))
      console.log("Withdrawal success", data);
    } catch (error) {
      setIsWithdraw(false)
      toast.error('Funds cannot be withdrawn until the target is reached.')
      console.log("Withdrawal failure", error);
    }
  }

  const withdrawFundDonator = async (pId) => {
    
    try {
      const data = await contract.call('withdrawFundDonator', [pId]);
      toast('Withdraw Successful')
      console.log("Withdrawal success", data);
    } catch (error) {
      toast.error('Withdrawal is only allowed after the campaign deadline.')
      console.log("Withdrawal failure", error);
    }
  }

  // Check
    const checkWithdraw = () => {
      let data = localStorage.getItem('iswithdraw')
      if(data) setIsWithdraw(JSON.parse(data))
    }
  useEffect(()=>{
    checkWithdraw()
  }, [isWithdraw, setIsWithdraw])
  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        withdrawCampaignOwner,
        withdrawFundDonator,
        isWithdraw
      }}
    >
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);