import React from 'react';
import axios from 'axios';
import Header from './Header';
import EventList from './EventList';
import PropTypes from 'prop-types';
import PropsRoute from './PropsRoute';
import Event from './Event';
import { Switch } from 'react-router-dom';
import EventForm from './EventForm';
import { success } from '../helpers/notifications';
import { handleAjaxError } from '../helpers/helpers';

class Editor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: null,
    };

    this.deleteEvent = this.deleteEvent.bind(this);
  }

  componentDidMount() {
    axios
      .get('/api/v1/events.json')
      .then(response => this.setState({ events: response.data }))
      .catch(handleAjaxError);
  }

  deleteEvent(eventId) {
    const sure = window.confirm('Are you sure?');
    if (sure) {
      axios
        .delete(`/api/v1/events/${eventId}.json`)
        .then((response) => {
          if (response.status === 204) {
            success('Event deleted');
              const { history } = this.props;
              history.push('/events');

              const { events } = this.state;
              this.setState({ events: events.filter(event => event.id !== eventId) });
            }
          })
          .catch(handleAjaxError);
      }
  }

  addEvent(newEvent) {
    axios
      .post('/api/v1/events.json', newEvent)
      .then((response) => {
        success('Event Added!');
        const savedEvent = response.data;
        this.setState(prevState => ({
          events: [...prevState.events, savedEvent],
        }));
        const { history } = this.props;
        history.push(`/events/${savedEvent.id}`);
      })
      .catch(handleAjaxError);
  }

  render() {
    const { events } = this.state;
    if (events === null) return null;

    const { match } = this.props;
    const eventId = match.params.id;
    const event = events.find(e => e.id === Number(eventId));

    return (
      <div>
        <Header />
        <div className="grid">
          <EventList events={events} activeId={Number(eventId)} />
          <Switch>
            <PropsRoute path="/events/new" component={EventForm} onSubmit={this.addEvent} />
            <PropsRoute path="/events/:id" component={Event} event={event} onDelete={this.deleteEvent}/>
          </Switch>
        </div>
      </div>
    );
  }
}

Editor.defaultProps = {
  match: undefined,
};

Editor.propTypes = {
  match: PropTypes.shape(),
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default Editor;
