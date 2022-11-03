const { createApp } = Vue

createApp({
  data() {
    return {
        listAllPrinters : [],
        myPrinters : ["canno01", "hp01"],
        lastUpdate : { 
            "0" : 12232,
        },
        jobs : { 
            "0" :  [  { id: 1111  } , { }  ],
            1 : [  { id: 2222  } , { }  ],
        },
        jobIdStartTime : { 
            "Canon G2010 series:21" : 123312235
        },
        status : { 
            "0" : "ok" // fail, 
        }
        timer : {  },  //secs
        version : "1.0.0",
    }
  },
  methods : { 
    main () { 
        // get all list

        // restore my printer

        // read timer settings

        // loop fetch printer api 
    },
    getAllListPrinter() { 

    },
    restoreMyPrinter() { 

    },
    readTimerSetting() { 

    }, 
    loopPrinterApi () { 

        for (let index = 0; index < this.myPrinters.length; index++) {
            const printerName = this.myPrinters[index];
            let res =  await axios.get('//get-job')
            let jobs = res.data
            this.jobs[index] = jobs
            this.registerJobTimestamp(printerName, jobs )
          
        }
        makeAlert()
        
    },
    registerJobTimestamp(printerName, jobs) { 

        let errorFlag = false
        _.for(jobs, (job)=>{
            let keyId  = `${printerName}:${job.id}`
            if(this.jobIdStartTime[keyId] == undefined) { 
                this.jobIdStartTime[keyId] = new Date().valueOf()
            }  
            
            let now = new Date().valueOf()
            let start = this.jobIdStartTime[keyId]

            let elasp = now - start 
            if(elasp > 30*1000 )  { 
                errorFlag = true
            }

             
        })

         // alert
        if(errorFlag) { 
             this.status[printerName] = "fail"
        }else { 
            this.status[printerName] = "ok"
        }
    },
    makeAlert() { 
        
        let hasError = _.values(this.status) // [ 'ok', 'ok', 'fail']
        hasError = _.filter(hasError, item => item == "fail")
        
        if(hasErro.length >= 1) {
            // noti
            // play sound
        }
    }
  },

  
}).mount('#app')



//
// "jobs": [
//     {
//       "id": 21,
//       "name": "Canon G2010 series",
//       "printerName": "Canon G2010 series",
//       "user": "ZIM",
//       "format": "NT EMF 1.008",
//       "priority": 1,
//       "size": 1024,
//       "status": [
        
//       ],
//       "machineName": "\\\\DESKTOP-RJE2A9S",
//       "document": "*Untitled - Notepad",
//       "notifyName": "ZIM",
//       "printProcessor": "Canon G2010 series Print Processor",
//       "driverName": "Canon G2010 series",
//       "position": 1,
//       "startTime": 0,
//       "untilTime": 0,
//       "totalPages": 1,
//       "time": 0,
//       "pagesPrinted": 0
//     }
//   ]