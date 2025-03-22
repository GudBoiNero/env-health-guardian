import React from "react";
import { Card, Col, Row, Statistic, Descriptions, Avatar, Tag } from "antd";

interface WeatherProps {
    data: {
        location: {
            name: string;
            region: string;
            country: string;
            lat: number;
            lon: number;
            tz_id: string;
            localtime_epoch: number;
            localtime: string;
        };
        current: {
            temp_c: number;
            temp_f: number;
            condition: {
                text: string;
                icon: string;
            };
            wind_mph: number;
            wind_kph: number;
            wind_degree: number;
            wind_dir: string;
            pressure_mb: number;
            pressure_in: number;
            precip_mm: number;
            precip_in: number;
            humidity: number;
            cloud: number;
            feelslike_c: number;
            feelslike_f: number;
            windchill_c: number;
            windchill_f: number;
            heatindex_c: number;
            heatindex_f: number;
            dewpoint_c: number;
            dewpoint_f: number;
            vis_km: number;
            vis_miles: number;
            uv: number;
            gust_mph: number;
            gust_kph: number;
        };
    };
}

const WeatherDashboard: React.FC<WeatherProps> = ({ data }) => {
    const {
        location,
        current: {
            temp_c,
            temp_f,
            condition,
            wind_mph,
            pressure_mb,
            humidity,
            feelslike_c,
            feelslike_f,
            windchill_c,
            windchill_f,
            dewpoint_c,
            dewpoint_f,
            vis_km,
            vis_miles,
            uv,
            gust_mph,
        },
    } = data;

    return (
        <div>
            <Row gutter={[16, 16]}>
                {/* Location Info */}
                <Col span={24} style={{ paddingBottom: '1em' }}>
                    <Card title={`${location.name}, ${location.region}, ${location.country}`}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Time">{location.localtime}</Descriptions.Item>
                            <Descriptions.Item label="Coordinates">{`Lat: ${location.lat}, Lon: ${location.lon}`}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Weather Info */}
                <Col span={24} sm={12}>
                    <Card
                        title="Current Weather"
                        extra={<Avatar src={`//cdn.weatherapi.com/weather/64x64/day/113.png`} />}
                        style={{ height: "100%" }}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Temperature"
                                    value={`${temp_f}°F / ${temp_c}°C`}
                                    valueStyle={{ fontSize: "24px", fontWeight: "bold" }}
                                />
                                <Statistic
                                    title="Feels Like"
                                    value={`${feelslike_f}°F / ${feelslike_c}°C`}
                                    valueStyle={{ fontSize: "20px" }}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Wind Speed"
                                    value={wind_mph}
                                    suffix=" mph"
                                />
                                <Statistic
                                    title="Wind Chill"
                                    value={`${windchill_f}°F / ${windchill_c}°C`}
                                    valueStyle={{ fontSize: "20px" }}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Tag color="blue">{condition.text}</Tag>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {/* Additional Data */}
                <Col span={24} sm={12}>
                    <Card title="Weather Details" style={{ height: "100%" }}>
                        <Descriptions column={1}>
                            <Descriptions.Item label="Pressure">{pressure_mb} mb</Descriptions.Item>
                            <Descriptions.Item label="Humidity">{humidity} %</Descriptions.Item>
                            <Descriptions.Item label="Dewpoint">
                                {`${dewpoint_f}°F / ${dewpoint_c}°C`}
                            </Descriptions.Item>
                            <Descriptions.Item label="Visibility">
                                {`${vis_km} km / ${vis_miles} miles`}
                            </Descriptions.Item>
                            <Descriptions.Item label="UV Index">{uv}</Descriptions.Item>
                            <Descriptions.Item label="Gust Speed">{gust_mph} mph</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default WeatherDashboard;
