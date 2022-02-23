import CurrentChart from "./CurrentChart/CurrentChart";
import "./styles/LakeConditions.css";

function LakeConditions(props) {
  return (
    <div className="content-wrapper">
        <div className='image-container'>
            <img src="lake-two.jpg"></img>
            <div className='page-description-container'>
                <div className='page-description-title'> Lake Conditions </div>
                <div className='page-description'>
                    View lake forecasts
                </div>
                <div className='page-last-updated'> Last updated at 6:05 PM February 22, 2022</div>
            </div>
        </div>

      <div className="model-figure-container">
        <div className="fig-container">
            <img src="LTPic.png" className="Pic" />
        </div>
        <CurrentChart height={600}/>
      </div>

    </div>
  )
}

export default LakeConditions;