import { Card } from 'react-bootstrap';
import 'styles/Message.css';

export const Message = ({ error }) => {
    return (
        <Card>
            <Card.Body>
                <Card>
                    <Card.Body className="message-body">                        
                        {error && <div role="alert">{error}</div>}
                    </Card.Body>
                </Card>
            </Card.Body>
        </Card>
    );
}