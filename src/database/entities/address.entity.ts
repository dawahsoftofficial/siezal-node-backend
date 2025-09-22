import { BaseEntity } from "src/core/base/entity/entity.base";
import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { IAddress } from "src/module/address/interface/address.interface";

@Entity({ name: "addresses" })
export class Address extends BaseEntity implements IAddress {
    @Column({ name: "user_id" })
    userId: number;

    @Column({ name: "shipping_address_line_1", type: "varchar", length: 255 })
    shippingAddressLine1: string;

    @Column({ name: "shipping_address_line_2", type: "varchar", length: 255, nullable: true })
    shippingAddressLine2?: string | null;

    @Column({ name: "shipping_postal_code", type: "varchar", length: 20 })
    shippingPostalCode: string;

    @Column({ name: "shipping_city", type: "varchar", length: 100 })
    shippingCity: string;

    @Column({ name: "shipping_country", type: "varchar", length: 100 })
    shippingCountry: string;

    @Column({ name: "shipping_state", type: "varchar", length: 100 })
    shippingState: string;

    @ManyToOne(() => User, (user) => user.addresses, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user?: User | null;

}
