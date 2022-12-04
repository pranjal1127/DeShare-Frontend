import axios from "axios"

const baseUrl = 'http://localhost:3001/api'

export const EndPoints = {
    login                     : `${baseUrl}/login`,
    viewContent               : `${baseUrl}/view-content`,
    claimIncentive            : `${baseUrl}/find-incentive`,
    getLastMonthIncentiveData :  `${baseUrl}/get-incentive-data`,

}

export const callAPI = async ( method: string,url: string, body: any = {}) => {
    try{
        console.log(url)
        if(method == 'post'){
            const response = await axios.post(url, body);
            return response.data;
        }else if(method == 'get'){
            const response = await axios.get(url);
            return response.data;
        }
        return 
    }catch(error:any){
        const errorMessage =  error?.response?.data?.message || error?.reason || error?.message;
        alert(errorMessage);
        console.log(error)
        return {
            code: error.code || 500,
            message: errorMessage 
        }
    }

}