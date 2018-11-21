// Import React.
import React from 'react'

const apiUrl = '/hackertarget/reverseiplookup/?q='

export class DummyComponent extends React.Component {

  constructor (props) {
    super(props);
    this.state = {
        inputvalue: ''
    }
    //this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit (event) {
    event.preventDefault()
       console.log('Form value: ' + this.state.inputvalue);
       fetch(apiUrl+encodeURIComponent(this.state.inputvalue))
       .then(res => res.text())
       .then(res => {
         if(res.error) {
           console.error(res.error)
         } else {
           console.log(res.split('\n'))
         }
       })

   }

   handleChange (event) {
       this.setState({
           inputvalue: event.target.value
       })
   }

   render() {
     return (
       <form onSubmit={this.handleSubmit.bind(this)}>
               <label> IP</label>
               <input type="text" value={this.state.inputvalue} onChange={this.handleChange.bind(this)}/>
               <input type="submit" value="Submit"/>
       </form>
     )
   }
 }
